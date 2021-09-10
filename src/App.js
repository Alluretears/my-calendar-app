import "react-big-calendar/lib/css/react-big-calendar.css";
import "./index.css";
import "./App.scss";
import React, { Fragment, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import moment from "moment";
import "moment/locale/zh-cn";
import clsx from "clsx";
import * as dates from "date-arithmetic";
import { Lunar } from "lunar-javascript";
import Year from "./Year";
import Toolbar from "./Toolbar";

function App() {
  // 设置为中文
  moment.locale("zh-cn", {
    week: {
      // 从周日开始
      dow: 0,
    },
  });

  const localizer = momentLocalizer(moment);

  let currentDate = new Date();

  // 自定义时间间隔头部组件
  const customTimeGutterHeader = () => (
    <div className={"time-gutter-header"}>全天</div>
  );

  // 自定义周视图头部组件
  const customWeekHeader = ({ date, label, localizer }) => {
    const lunarDate = Lunar.fromDate(date);
    const isCurrent = dates.eq(date, currentDate, "day");
    if (isCurrent) {
      return (
        <Fragment>
          <span className={clsx("week-header-today")}>
            {localizer.format(date, "D")}
          </span>
          <span className="week-header-day">
            {localizer.format(date, "ddd")}
          </span>
          <span>{lunarDate.getDayInChinese()}</span>
        </Fragment>
      );
    } else {
      return (
        <Fragment>
          <span className={"week-header-day"}>{label}</span>
          <span>{lunarDate.getDayInChinese()}</span>
        </Fragment>
      );
    }
  };

  // 自定义月视图单个日期格子的头部组件，即显示日期和对应的农历
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

  const customEventCellWrapper = (props) => {
    return (
      <Popup
        trigger={(open) => props.children}
        position={["right center", "bottom center", "top center"]}
        on={"click"}
        keepTooltipInside=".Calendar"
        closeOnDocumentClick
      >
        <span>hello</span>
      </Popup>
    );
  };

  const customMonthEvent = (props) => {
    let { event, title } = props;
    return (
      <Fragment>
        <span>{title}</span>
        <span>{localizer.format(event.start, "H:mm")}</span>
      </Fragment>
    );
  };

  const components = {
    toolbar: Toolbar,
    timeGutterHeader: customTimeGutterHeader,
    eventWrapper: customEventCellWrapper,
    month: {
      dateHeader: customDateHeader,
      event: customMonthEvent,
    },
    week: {
      header: customWeekHeader,
    },
  };

  // 自定义单个日期格子容器的 style，包含周视图和月视图
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

  const localEventsStr = localStorage.getItem("events");
  const localEvents = localEventsStr
    ? JSON.parse(localEventsStr).map((e) =>
        Object.assign(e, { start: new Date(e.start), end: new Date(e.end) })
      )
    : [];
  const [events, setEvents] = useState(localEvents);

  const handleSelect = ({ start, end, slots, action }) => {
    if (action === "doubleClick") {
      const current = new Date();
      let event;
      if (slots && slots.length === 1) {
        // 当前选中的是月视图
        if (dates.eq(slots[0], current, "day")) {
          // 今天
          const newStart = dates.add(current, 1, "hours");
          newStart.setMinutes(0, 0, 0);
          const newEnd = dates.add(newStart, 1, "hours");
          event = {
            start: newStart,
            end: newEnd,
            title: "新建日程",
            isAllDay: true,
          };
        } else {
          //非今天
          const newStart = new Date(start);
          newStart.setHours(9, 0, 0, 0);
          const newEnd = dates.add(newStart, 1, "hours");
          event = {
            start: newStart,
            end: newEnd,
            title: "新建日程",
            isAllDay: true,
          };
        }
      } else {
        const newEnd = dates.add(start, 1, "hours");
        event = {
          start: start,
          end: newEnd,
          title: "新建日程",
          isAllDay: false,
        };
      }
      if (event) {
        setEvents([...events, event]);
        localStorage.setItem("events", JSON.stringify([...events, event]));
      }
    }
  };

  return (
    <div className="App">
      <Calendar
        className={"Calendar"}
        localizer={localizer}
        selectable={true}
        views={{
          day: true,
          week: true,
          month: true,
          year: Year,
        }}
        events={events}
        onSelectSlot={handleSelect}
        popup={true}
        toolbar={true}
        components={components}
        step={15}
        timeslots={4}
        getDrilldownView={(
          targetDate,
          currentViewName,
          configuredViewNames
        ) => {
          if (
            currentViewName === "year" &&
            configuredViewNames.includes("year")
          ) {
            return "month";
          }
          return "day";
        }}
        dayPropGetter={customDayPropGetter}
        formats={{
          dayHeaderFormat: "YYYY年M月D日",
          dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
            localizer.format(start, "M月D日", culture) +
            "-" +
            localizer.format(end, "M月D日", culture),
          monthHeaderFormat: "YYYY年M月",
          dayFormat: "D ddd",
          dateFormat: "D",
        }}
        messages={{
          year: "年",

          date: "日期",
          time: "时间",
          event: "日程",
          allDay: "全天",
          week: "周",
          work_week: "工作日",
          day: "日",
          month: "月",
          previous: "前一个",
          next: "后一个",
          yesterday: "昨天",
          tomorrow: "明天",
          today: "今天",
          agenda: "议程",
          noEventsInRange: "该日期范围内没有日程",
          showMore: (total) => `还有${total}项...`,
        }}
        dayLayoutAlgorithm={"no-overlap"}
      />
    </div>
  );
}

export default App;
