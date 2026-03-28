import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { QuestionnaireLayout } from "./components/QuestionnaireLayout";
import { BasicInfo } from "./components/steps/BasicInfo";
import { BodyMetrics } from "./components/steps/BodyMetrics";
import { Lifestyle } from "./components/steps/Lifestyle";
import { Exercise } from "./components/steps/Exercise";
import { Diet } from "./components/steps/Diet";
import { Habits } from "./components/steps/Habits";
import { WorkMentalHealth } from "./components/steps/WorkMentalHealth";
import { History } from "./components/steps/History";
import { Loading } from "./components/steps/Loading";
import { Dashboard } from "./components/steps/Dashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        Component: QuestionnaireLayout,
        children: [
          { index: true, Component: BasicInfo },
          { path: "body-metrics", Component: BodyMetrics },
          { path: "lifestyle", Component: Lifestyle },
          { path: "exercise", Component: Exercise },
          { path: "diet", Component: Diet },
          { path: "habits", Component: Habits },
          { path: "work-mental-health", Component: WorkMentalHealth },
          { path: "history", Component: History },
          { path: "loading", Component: Loading },
          { path: "dashboard", Component: Dashboard },
        ],
      },
    ],
  },
]);
