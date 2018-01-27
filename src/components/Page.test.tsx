// Packages
import renderer = require("react-test-renderer");
import React from "react";
import { MemoryRouter, Route } from "react-router-dom";
// Libs
import Page from "./Page";
import { sleep } from "../lib/helper";

test("Link changes the class when hovered", async () => {
  const component = renderer.create(
    <MemoryRouter initialEntries={["/Home"]}>
      <Route component={Page} />
    </MemoryRouter>
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

  await sleep();

  tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});