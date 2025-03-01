import { requestsAtom } from "@/atoms/requests";
import { Button } from "@/components/shared/buttons/button";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { getLocalTimeZone, Time, today } from "@internationalized/date";
import { useSetAtom } from "jotai";
import { useState } from "react";
import {
  Calendar,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DateSegment,
  Heading,
  Button as ReactAriaButton,
  TimeField,
  TimeValue,
} from "react-aria-components";

interface CalendarModalProps {
  isVisible: boolean;
  onSubmit: ({ fromDate, toDate }: { fromDate: Date; toDate: Date }) => void;
  onCancel: VoidFunction;
}

enum VisibileCalendar {
  FROM,
  TO,
  NONE,
}

export function CalendarModal({ isVisible, onSubmit, onCancel }: CalendarModalProps) {
  const [visibleCalendar, setVisibleCalendar] = useState(VisibileCalendar.NONE);
  const setRequests = useSetAtom(requestsAtom);

  const defaultFromDate = new Date();
  defaultFromDate.setHours(defaultFromDate.getHours() - 1);
  const [fromDate, setFromDate] = useState<Date>(defaultFromDate);
  const [toDate, setToDate] = useState<Date>(new Date());

  const [fromTime, setFromTime] = useState<TimeValue | null>(
    new Time(fromDate.getHours(), fromDate.getMinutes()),
  );
  const [toTime, setToTime] = useState<TimeValue | null>(
    new Time(toDate.getHours(), toDate.getMinutes()),
  );

  return (
    <Dialog
      open={isVisible}
      onClose={onCancel}
      transition
      className="fixed flex w-screen items-center  justify-center bg-black/50 transition duration-100 ease-out data-[closed]:opacity-0 ">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/20 duration-100 ease-out data-[closed]:opacity-0 "
      />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4 text-sm">
        <DialogPanel
          transition
          className="space-y-4 border-[0.5px] rounded-lg shadow-lg bg-admin-bg-secondary-dark p-6 transition duration-75 ease-out data-[closed]:translate-y-2">
          <DialogTitle className={"text-center"}>Set date range</DialogTitle>
          <div className="flex flex-row gap-5 items-start">
            <div className="flexflex-col gap-2 justify-center">
              <div className="flex h-12 items-center justify-start">
                <p>From</p>
              </div>
              <div className="flex h-12 items-center justify-start">
                <p>To</p>
              </div>
            </div>
            <div className="flex flex-col items-start">
              <div className="flex h-12 items-center justify-start gap-2">
                <Button
                  label={fromDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  onClick={() => setVisibleCalendar(VisibileCalendar.FROM)}
                  display={{ className: "w-28 ", type: "secondary" }}
                />
                <TimeField value={fromTime} onChange={setFromTime} granularity="second">
                  <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
                </TimeField>
              </div>
              <div className="flex h-12 items-center justify-start gap-2 ">
                <Button
                  label={toDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  onClick={() => setVisibleCalendar(VisibileCalendar.TO)}
                  display={{ className: "w-28", type: "secondary" }}
                />
                <TimeField value={toTime} onChange={setToTime} granularity="second">
                  <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
                </TimeField>
              </div>
            </div>
          </div>
          <Dialog
            open={visibleCalendar !== VisibileCalendar.NONE}
            onClose={() => setVisibleCalendar(VisibileCalendar.NONE)}
            className="flex flex-col">
            <div className="fixed inset-0 flex w-screen items-center justify-center p-4 text-sm">
              <DialogPanel
                transition
                className={`absolute bg-admin-bg-secondary-dark flex-col transition duration-100 ease-out data-[closed]:opacity-0 data-[closed]:translate-y-2 p-5 shadow-xl justify-center items-center overflow-y-auto border-[0.5px] border-admin-text-light rounded-md`}>
                <Calendar
                  aria-label="Appointment date"
                  maxValue={today(getLocalTimeZone())}
                  onChange={dateValue => {
                    if (visibleCalendar === VisibileCalendar.FROM) {
                      const newDate = fromDate;
                      newDate.setMonth(dateValue.month - 1);
                      newDate.setDate(dateValue.day);
                      setFromDate(newDate);
                    }
                    if (visibleCalendar === VisibileCalendar.TO) {
                      const newDate = toDate;
                      newDate.setMonth(dateValue.month - 1);
                      newDate.setDate(dateValue.day);
                      setToDate(newDate);
                    }
                    setVisibleCalendar(VisibileCalendar.NONE);
                  }}>
                  <header>
                    <ReactAriaButton slot="previous">◀</ReactAriaButton>
                    <Heading />
                    <ReactAriaButton slot="next">▶</ReactAriaButton>
                  </header>
                  <CalendarGrid>{date => <CalendarCell date={date} />}</CalendarGrid>
                </Calendar>
              </DialogPanel>
            </div>
          </Dialog>
          <div className="flex justify-center">
            <Button
              label="Filter"
              onClick={() => {
                setRequests(prev => ({ ...prev, fromDate, toDate }));
                fromDate.setHours(fromTime?.hour ?? 0, fromTime?.minute ?? 0, 0, 0);
                toDate.setHours(toTime?.hour ?? 0, toTime?.minute ?? 0, 0, 0);
                onSubmit({ fromDate, toDate });
              }}
              display={{ size: "md", className: "w-28" }}
            />
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
