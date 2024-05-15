import { useContext } from "react";
import { describe, test, expect, afterEach, vi } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";

import {
  ToastQueueProvider,
  ToastQueueContext,
} from "../ToastQueueProvider.jsx";

vi.mock("react-bootstrap/ToastContainer", () => ({
  default: Object.assign((props) => (
    <>
      <div data-testid="toastContainer">{`position: ${props.position}`}</div>
      {props.children}
    </>
  )),
}));

vi.mock("react-bootstrap/Toast", () => ({
  default: Object.assign(
    (props) => (
      <>
        <div data-testid="toast">{`delay: ${props.delay}, autohide: ${props.autohide}, bg: ${props.bg}`}</div>
        {props.children}
      </>
    ),
    {
      Header: (props) => <div data-testid="toast.header">{props.children}</div>,
      Body: (props) => <div data-testid="toast.body">{props.children}</div>,
    },
  ),
}));

function TestConsumerComponent({ toastData }) {
  const { createToast } = useContext(ToastQueueContext);
  return (
    <button
      data-testid="createToastButton"
      onClick={() => createToast(toastData)}
    ></button>
  );
}

describe("<ToastQueueProvider />", () => {
  afterEach(() => {
    cleanup();
  });

  test("ToastQueueProvider expected to render without error", () => {
    render(<ToastQueueProvider />);
  });

  // createToast() function

  test("createToast() renders basic toast.", () => {
    const { getByTestId, getByText } = render(
      <ToastQueueProvider>
        <TestConsumerComponent
          toastData={{ title: "test title", body: "test body" }}
        />
      </ToastQueueProvider>,
    );
    fireEvent.click(getByTestId("createToastButton"));
    getByText("test title");
    getByText("test body");
  });

  test("createToast() sets toast autohide to true.", async () => {
    const { getByTestId, getByText } = render(
      <ToastQueueProvider autohideDelay={0}>
        <TestConsumerComponent
          toastData={{
            title: "test title",
            body: "test body",
            autohide: true,
          }}
        />
      </ToastQueueProvider>,
    );
    fireEvent.click(getByTestId("createToastButton"));
    getByText("autohide: true", { exact: false });
  });

  test("createToast() sets toast autohide to false.", async () => {
    const { getByTestId, getByText } = render(
      <ToastQueueProvider autohideDelay={0}>
        <TestConsumerComponent
          toastData={{
            title: "test title",
            body: "test body",
            autohide: false,
          }}
        />
      </ToastQueueProvider>,
    );
    fireEvent.click(getByTestId("createToastButton"));
    getByText("autohide: false", { exact: false });
  });

  test("createToast() renders variant toast.", () => {
    const { getByTestId, getByText } = render(
      <ToastQueueProvider>
        <TestConsumerComponent
          toastData={{
            title: "test title",
            body: "test body",
            bg: "secondary",
          }}
        />
      </ToastQueueProvider>,
    );
    fireEvent.click(getByTestId("createToastButton"));
    getByText("bg: secondary", { exact: false });
  });

  // ToastQueueProvider props

  test("ToastQueueProvider position prop", () => {
    const { getByTestId, getByText } = render(
      <ToastQueueProvider position="top-start">
        <TestConsumerComponent
          toastData={{ title: "test title", body: "test body" }}
        />
      </ToastQueueProvider>,
    );
    fireEvent.click(getByTestId("createToastButton"));
    getByText("position: top-start", { exact: false });
  });

  test("ToastQueueProvider autohideDelay prop", () => {
    const { getByTestId, getByText } = render(
      <ToastQueueProvider autohideDelay={123}>
        <TestConsumerComponent
          toastData={{ title: "test title", body: "test body" }}
        />
      </ToastQueueProvider>,
    );
    fireEvent.click(getByTestId("createToastButton"));
    getByText("delay: 123", { exact: false });
  });

  test("ToastQueueProvider maxToasts prop", () => {
    const { getByTestId, getAllByText } = render(
      <ToastQueueProvider maxToasts={2}>
        <TestConsumerComponent
          toastData={{ title: "test title", body: "test body" }}
        />
      </ToastQueueProvider>,
    );
    const createToastButton = getByTestId("createToastButton");
    fireEvent.click(createToastButton);
    fireEvent.click(createToastButton);
    fireEvent.click(createToastButton);
    expect(getAllByText("test body").length).toEqual(2);
  });
});

vi.clearAllMocks();
