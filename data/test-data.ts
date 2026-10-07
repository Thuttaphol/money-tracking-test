// @ts-nocheck

import { environment } from "../config/environment";

import { localData } from "./local/category.data";

const dataByEnvironment = {
  local: localData,
};

export const testData = dataByEnvironment[environment.name];
