import { environment } from "../config/environment";

import { localData } from "./local/category.data";
import { devData } from "./dev/category.data";
import { stagingData } from "./staging/category.data";

const dataByEnvironment = {
  local: localData,
  dev: devData,
  staging: stagingData,
};

export const testData = dataByEnvironment[environment.name];
