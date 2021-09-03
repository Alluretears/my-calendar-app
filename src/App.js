import "react-big-calendar/lib/css/react-big-calendar.css";
import "./App.scss";
import React, { Fragment } from "react";
import "./index.css";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/zh-cn";
import Year from "./Year";
import Toolbar from "./Toolbar";
import clsx from "clsx";
import * as dates from "date-arithmetic";
import { Lunar } from "lunar-javascript";

function App() {
  moment.locale("zh-cn", {
    week: {
      dow: 0,
    },
  });

  const localizer = momentLocalizer(moment);

  let currentDate = new Date();
  const customDateHeader = ({ label, date, drilldownView, onDrillDown }) => {
    if (!drilldownView) {
      return <span>{label}</span>;
    }

    const lunarDate = Lunar.fromDate(date);

    function renderDate(date) {
      const isCurrent = dates.eq(date, currentDate, "day");
      if (date.getDate() === 1) {
        if (isCurrent) {
          return (
            <Fragment>
              <span>{localizer.format(date, "M月")}</span>
              <span className={"month-today"}>
                {localizer.format(date, "D")}
              </span>
              <span>日</span>
            </Fragment>
          );
        } else {
          return <span>{localizer.format(date, "M月D日")}</span>;
        }
      } else {
        if (isCurrent) {
          return (
            <Fragment>
              <span className={clsx("month-today")}>
                {localizer.format(date, "D")}
              </span>
              <span>日</span>
            </Fragment>
          );
        } else {
          return <span>{localizer.format(date, "D日")}</span>;
        }
      }
    }

    return (
      <a href="#" onClick={onDrillDown} role="cell">
        <span className={"month-lunar-day"}>{lunarDate.getDayInChinese()}</span>
        {renderDate(date)}
      </a>
    );
  };

  const components = {
    toolbar: Toolbar,
    month: {
      dateHeader: customDateHeader,
    },
  };

  const customDayPropGetter = (date) => {
    if (date.getDay() === 0 || date.getDay() === 6)
      return {
        className: "weekend-day",
        style: {
          background: "#F5F5F5",
        },
      };
    else
      return {
        className: "normal-day",
        style: {
          background: "#FFFFFF",
        },
      };
  };

  return (
    <div className="App">
      <Calendar
        className={"Calendar"}
        localizer={localizer}
        events={[]}
        toolbar={true}
        components={components}
        views={{
          day: true,
          week: true,
          month: true,
          year: Year,
        }}
        dayPropGetter={customDayPropGetter}
        formats={{ dateFormat: "D" }}
        messages={{ year: "Year" }}
      />
    </div>
  );
}

export default App;
