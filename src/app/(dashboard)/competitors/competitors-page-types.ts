import type { ComponentProps } from "react";
import type { CompetitorsList } from "./competitors-list";

export type CompetitorsListProps = ComponentProps<typeof CompetitorsList>;

export type CompetitorsPageLoadResult =
    | { kind: "no-business" }
    | { kind: "error" }
    | {
          kind: "ok";
          recentAlertsCount: number;
          listProps: CompetitorsListProps;
      };
