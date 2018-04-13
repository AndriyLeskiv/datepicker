import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import * as moment from 'moment'

@Component({
  selector: 'app-datepicker',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss']
})
export class DatepickerComponent implements OnInit {
  public date = moment();
  public quarterDate = moment().startOf('year');
  public dateForm: FormGroup;

  public isReserved = null;

  public daysArr =[];
  public numWeeks = [];
  public quarter = []

  constructor(private fb: FormBuilder) {
    this.initDateRange();
  }
  public initDateRange() {
    return (this.dateForm = this.fb.group({
      dateFrom: [null, Validators.required],
      dateTo: [null, Validators.required]
    }));
  }

  public ngOnInit() {
    this.createCalendar(moment());
    this.createQuarter(this.quarterDate);
  }

  public resetValue() {
    this.numWeeks = [];
    this.daysArr = [];
  }

  public createCalendar(date) {
    this.resetValue();
    
    for (let i = 0; i < 3; i++) {
      const month = moment(date).add(i, "M");
      this.numWeeks.push(this.createNumWeeks(month));
      const monthDays = this.createCalendarMonth(month)
      this.daysArr.push(monthDays);
    }
  }
  
  public createCalendarMonth(month) {
    let firstDay = moment(month).startOf('M');
    let days = Array.apply(null, { length: month.daysInMonth()})
      .map(Number.call, Number)
      .map(n => {
        return moment(firstDay).add(n, 'd');
      });
    //start from monday
    //  let a = firstDay.weekday() - 1;
    //   if(a < 0) a = 6

    for (let n = 0; n < firstDay.weekday(); n++) {
      days.unshift(null);
    }
    return days;
  }

  public createNumWeeks(date) {
    let firstDay = moment(date).startOf('M');
    let lastDay = moment(date).endOf('M');
    let numWeeks = [];
    for(let i = firstDay.week(); i < lastDay.week() + 1; i++) {
      numWeeks.push(i);
    }
    return numWeeks;
  }

  public createQuarter(startDay) {
    this.quarter= [];
    for (let i = 0; i < 4; i++) {
      let oneQuarter = [];
      let firstQuarterDate = moment(startDay).add(i * 3, "M");
      for (let a = 0; a < 3; a++) {
        oneQuarter.push(moment(firstQuarterDate).add(a, "M"));
      }
      this.quarter.push(oneQuarter);
    }
  }

  public nextMonth() {
    this.date.add(1, 'M');
    this.createCalendar(this.date);
  }

  public previousMonth() {
    this.date.subtract(1, 'M');
    this.createCalendar(this.date);
  }
  public nextQuarter() {
    this.quarterDate.add(3, 'M');
    this.createQuarter(this.quarterDate);
  };

  public previousQuarter () {
    this.quarterDate.subtract(3, 'M');
    this.createQuarter(this.quarterDate);
  }

  public todayCheck(day) {
    if (!day) {
      return false;
    }
    return moment().format('L') === day.format('L');
  }

  public reserve() {
    if (!this.dateForm.valid) {
      return;
    }
    let dateFromMoment = this.dateForm.value.dateFrom;
    let dateToMoment = this.dateForm.value.dateTo;
    this.isReserved = `Reserved from ${dateFromMoment} to ${dateToMoment}`;
  }

  public isSelected(day) {
    if (!day) {
      return false;
    }
    let dateFromMoment = moment(this.dateForm.value.dateFrom, 'MM/DD/YYYY');
    let dateToMoment = moment(this.dateForm.value.dateTo, 'MM/DD/YYYY');
    if (this.dateForm.valid) {
      return (
        dateFromMoment.isSameOrBefore(day) && dateToMoment.isSameOrAfter(day)
      );
    }
    if (this.dateForm.get('dateFrom').valid) {
      return dateFromMoment.isSame(day);
    }
  }

  public selectedDate(day) {
    let dayFormatted = day.format('MM/DD/YYYY');
    if (this.dateForm.valid) {
      this.dateForm.setValue({ dateFrom: null, dateTo: null });
      return;
    }
    if (!this.dateForm.get('dateFrom').value) {
      this.dateForm.get('dateFrom').patchValue(dayFormatted);
    } else {
      this.dateForm.get('dateTo').patchValue(dayFormatted);
    }
  }
}
