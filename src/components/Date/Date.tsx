import { Tooltip } from "@material-ui/core";
import useDateLocalize from "@saleor/hooks/useDateLocalize";
import moment from "moment-timezone";
import React from "react";

import { LocaleConsumer } from "../Locale";
import { Consumer } from "./DateContext";
import { useStyles } from "./styles";

interface DateProps {
  date: string;
  plain?: boolean;
}

export const Date: React.FC<DateProps> = ({ date, plain }) => {
  const classes = useStyles();

  const localizeDate = useDateLocalize();

  const getHumanized = (value: string, locale: string, currentDate: number) =>
    moment(value).locale(locale).from(currentDate);

  return (
    <LocaleConsumer>
      {({ locale }) => (
        <Consumer>
          {currentDate =>
            plain ? (
              localizeDate(date)
            ) : (
              <Tooltip
                title={localizeDate(date)}
                PopperProps={{
                  className: classes.tooltip,
                }}
              >
                <time dateTime={date}>
                  {getHumanized(date, locale, currentDate)}
                </time>
              </Tooltip>
            )
          }
        </Consumer>
      )}
    </LocaleConsumer>
  );
};
Date.displayName = "Date";
export default Date;
