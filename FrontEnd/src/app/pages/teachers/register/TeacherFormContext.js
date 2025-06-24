import { createSafeContext } from "utils/createSafeContext";

export const [TeacherFormContextProvider, useTeacherFormContext] = createSafeContext(
    "useTeacherFormContext must be used within a TeacherFormContextProvider",
);