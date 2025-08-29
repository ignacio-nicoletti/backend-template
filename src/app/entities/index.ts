import * as user from "./user.schema";
import * as relations from "./relations";

export const schema = { ...user, ...relations };

export * from "./user.schema";
export * from "./relations";
