import React from "react";
import moment from "moment";
import * as dates from "date-arithmetic";
import { Navigate } from "react-big-calendar";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import "./Year.scss";

function DateCell(props) {
  const { date, currentMonthDate, events, localizer, getDrilldownView } = props;
  const today = dates.eq(date, new Date(), "day") ? "today" : "";

  if (date.getMonth() < currentMonthDate.getMonth()) {
    return (
      <button disabled={true} className="date prev-month">
        {date.getDate()}
      </button>
    );
  }

  if (date.getMonth() > currentMonthDate.getMonth()) {
    return (
      <button disabled={true} className="date next-month">
        {date.getDate()}
      </button>
    );
  }

  function renderEvents() {
    if (events && events.length > 0) {
      return (
        <div>
          {events.map((e) => (
            <div className={"my-popup-content-wrapper"}>
              <span>
                <span className={"my-popup-content-dot"} />
                <span className={"my-popup-content-title"}>{e.title}</span>
              </span>
              <span className={"my-popup-content-time"}>
                {e.allDay ? "全天" : localizer.format(e.start, "HH:mm")}
              </span>
            </div>
          ))}
        </div>
      );
    } else {
      return <span className={"my-popup-content-empty"}>无日程</span>;
    }
  }

  let drilldownView = getDrilldownView(date);

  function handleDoubleClick(date, view, e) {
    e.preventDefault();
    props.onDrillDown(date, view);
  }

  return (
    <Popup
      className="my-popup"
      offsetX={8}
      on={"click"}
      trigger={
        <button
          className={`date in-month ${today}`}
          onDoubleClick={(e) => handleDoubleClick(date, drilldownView, e)}
        >
          {date.getDate()}
        </button>
      }
      position={"right center"}
      closeOnDocumentClick
      closeOnEscape
    >
      {renderEvents}
    </Popup>
  );
}

class MonthGrid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      monthData: {
        date: new Date(),
        weeks: [],
      },
    };
  }

  getMonthData(date) {
    const mom = date ? moment(date) : moment();

    const first = mom.clone().startOf("month");
    const last = mom.clone().endOf("month");
    const weeksCount = Math.ceil((first.day() + last.date()) / 7);
    const monthData = {
      date: mom.toDate(),
      weeks: [],
    };

    for (let weekNumber = 0; weekNumber < weeksCount; weekNumber++) {
      const weekDates = [];
      for (let day = 7 * weekNumber; day < 7 * (weekNumber + 1); day++) {
        const date = mom.clone().set("date", day + 1 - first.day());
        weekDates.push(date.toDate());
      }
      monthData.weeks.push(weekDates);
    }

    return monthData;
  }

  componentDidMount() {
    this.setState({ monthData: this.getMonthData(this.props.date) });
  }

  componentDidUpdate(prevProps) {
    if (this.props.date !== prevProps.date) {
      this.setState({ monthData: this.getMonthData(this.props.date) });
    }
  }

  render() {
    if (!this.state.monthData) {
      return null;
    }
    let { events, localizer, ...props } = this.props;
    return (
      <div className="month">
        <div className="month-name">
          {localizer.format(this.state.monthData.date, "MMMM").toUpperCase()}
        </div>
        <div className="day-row">
          {moment.weekdaysMin().map((day, index) => (
            <span key={index} className="day">
              {day}
            </span>
          ))}
        </div>
        {this.state.monthData.weeks.map((week, index) => (
          <div key={index} className="date-row">
            {week.map((date) => {
              const dateStart = dates.startOf(date, "day");
              const dateEnd = dates.endOf(date, "day");
              const dateEvents = events.filter(
                (e) =>
                  dates.gte(dateEnd, e.end, "minutes") &&
                  dates.lt(dateStart, e.start, "minutes")
              );

              return (
                <DateCell
                  {...props}
                  key={date.getDate()}
                  date={date}
                  currentMonthDate={this.state.monthData.date}
                  events={dateEvents}
                  localizer={localizer}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  }
}

class Year extends React.Component {
  inRange(e, start, end, accessors) {
    let eStart = dates.startOf(accessors.start(e), "day");
    let eEnd = accessors.end(e);

    let startsBeforeEnd = dates.lte(eStart, end, "day");
    // when the event is zero duration we need to handle a bit differently
    let endsAfterStart = !dates.eq(eStart, eEnd, "minutes")
      ? dates.gt(eEnd, start, "minutes")
      : dates.gte(eEnd, start, "minutes");

    return startsBeforeEnd && endsAfterStart;
  }

  render() {
    let { date, events, accessors, ...props } = this.props;
    const months = [];
    const firstMonth = dates.startOf(date, "year");
    for (let i = 0; i < 12; i++) {
      const m = new Date();
      m.setMonth(i);
      const monthStart = dates.startOf(m, "month");
      const monthEnd = dates.endOf(m, "month");
      const monthEvents = events.filter((e) =>
        this.inRange(e, monthStart, monthEnd, accessors)
      );
      months.push(
        <MonthGrid
          {...props}
          key={i + 1}
          date={dates.add(firstMonth, i, "month")}
          events={monthEvents}
        />
      );
    }

    return <div className="year">{months.map((month) => month)}</div>;
  }
}

Year.range = (date) => {
  return [dates.startOf(date, "year")];
};

Year.navigate = (date, action) => {
  switch (action) {
    case Navigate.PREVIOUS:
      return dates.add(date, -1, "year");

    case Navigate.NEXT:
      return dates.add(date, 1, "year");

    default:
      return date;
  }
};

Year.title = (date, { localizer }) => localizer.format(date, "YYYY年");

export default Year;
