import { Component, OnInit, ViewEncapsulation, Output } from '@angular/core';
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

  @Output() dateOut: any;

  public isOpened: boolean;
  public date = moment();
  public quarterDate = moment().startOf('year');
  public dateForm: FormGroup;

  public error: boolean;
  public daysArr = [];
  public numWeeks = [];
  public quarter = [];
  public years = [];
  public quartersNum = ['st', 'nd', 'rd', 'th'];
  public daysOfWeek = ['Wk','Mo','Tu','We','Th','Fr','Sa', 'Su'];

  public hoverDate = null;

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
    moment.updateLocale('en', {
      week: {
        dow: 1,
        doy : 7
      },
    })

    this.createCalendar(moment());
    this.createQuarter(this.quarterDate);
    this.createYears(moment());
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
    let lastDay = moment(month).endOf('M');
    let days = Array.apply(null, { length: month.daysInMonth()})
      .map(Number.call, Number)
      .map(n => {
        return moment(firstDay).add(n, 'd');
      });
    //start from monday
    //  let a = firstDay.weekday() - 1;
    //   if(a < 0) a = 6

    for (let n = 0; n < firstDay.weekday(); n++) {
      days.unshift(moment(firstDay).subtract(n + 1, 'days'));
    }
    if(lastDay.weekday() != 6){
      for (let n = 0; n < lastDay.weekday(); n++) {
        days.splice(-1, 1);
      }
      days.splice(-1, 1);
    }

    return days;
  }

  public createNumWeeks(date) {

    let firstDay = moment(date).startOf('M');
    let lastDay = moment(date).endOf('M');
    let numWeeks = [];
    let key;
    if (firstDay.week() > lastDay.week()){
      key = true;
      lastDay = moment(date).endOf('M').subtract(7, 'days');
    }
    for(let i = firstDay.week(); i < lastDay.week() + 1; i++) {
      numWeeks.push(i);
    }
    if (lastDay.weekday() != 6 && !key) {
      numWeeks.splice(-1, 1);
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

  public createYears(date) {
    let firstDay = moment(date).startOf('year');
    this.years = [];
    for (let i = 0; i < 3; i++) {
      this.years.push(moment(firstDay).subtract(i, "year"));
    }
    this.years.reverse()
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

  public isSelected(day) {
    if (!day) {
      return false;
    }
    let dateFromMoment = moment(this.dateForm.value.dateFrom, 'MM/DD/YYYY');
    let dateToMoment = moment(this.dateForm.value.dateTo, 'MM/DD/YYYY');
    if (this.dateForm.valid) {
      return (
        (dateFromMoment.isSameOrBefore(day) && dateToMoment.isSameOrAfter(day)) ||
        (dateFromMoment.isSameOrAfter(day) && dateToMoment.isSameOrBefore(day))
      );
    }
    if (this.dateForm.get('dateFrom').valid) {
      return dateFromMoment.isSame(day);
    }
  }

  public checkDate(day, reset?) {
    this.error = false;
    if (!day) return false;
    if( reset) {
      this.dateForm.setValue({ dateFrom: null, dateTo: null });
      return true;
    }
    if (this.dateForm.valid) this.dateForm.setValue({ dateFrom: null, dateTo: null });
    return true;
  }

  public updateCalendar(day) {
    this.date = moment(day).endOf('week').startOf('M');
    this.createCalendar(this.date);
  }

  public selectedDate(day) {
    if(!(this.checkDate(day))) return;
    let dayFormatted = day.format('MM/DD/YYYY');
    if (!this.dateForm.get('dateFrom').value) {
      this.dateForm.get('dateFrom').patchValue(dayFormatted);
    } else {
      let dateTo = moment(this.dateForm.get('dateFrom').value, 'MM/DD/YYYY')
      if((dateTo).isSameOrAfter(day) ){
        
        this.dateForm.get('dateFrom').patchValue(dayFormatted);
        this.dateForm.get('dateTo').patchValue(dateTo.format('MM/DD/YYYY'));
        return;
      }
      this.dateForm.get('dateTo').patchValue(dayFormatted);
    }
  }

  public selectedQuarter(day) {
    if(!(this.checkDate(day))) return;
    let date = this.createBroadcasterCalendarDate(day, 'M');
    if (!this.dateForm.get('dateFrom').value) {
      this.dateForm.get('dateFrom').patchValue(date.firstDay);
      this.updateCalendar(date.firstDay);
    } else {
      let dateTo = moment(this.dateForm.get('dateFrom').value, 'MM/DD/YYYY')
      if((dateTo).isSameOrAfter(day) ){
        return;
        // TO_DO write reverse
      }

      this.dateForm.get('dateTo').patchValue(date.lastDay);
    }
  }
 

  public selectedOneQuarter(day) {
    if(!(this.checkDate(day, true))) return;
    let firstDay = moment(day).startOf('M').startOf('isoWeek').format('MM/DD/YYYY');
    let lastDay =  moment(day).endOf('M').add(2, "M").subtract(1,'week').endOf('isoWeek').format('MM/DD/YYYY');
    if (!this.dateForm.get('dateFrom').value) {
      this.dateForm.get('dateFrom').patchValue(firstDay);
      this.dateForm.get('dateTo').patchValue(lastDay);
     this.updateCalendar(firstDay);
    }
  }

  public selectedYear (day) {
    if(!(this.checkDate(day, true))) return;
    let date = this.createBroadcasterCalendarDate(day, 'year');

    if (!this.dateForm.get('dateFrom').value) {
      this.dateForm.get('dateFrom').patchValue(date.firstDay);
      this.dateForm.get('dateTo').patchValue(date.lastDay);
      this.quarterDate = moment(date.firstDay).endOf('isoWeek').startOf('M');
      this.createQuarter(this.quarterDate);
      this.updateCalendar(date.firstDay);
    }
  }

  public createBroadcasterCalendarDate(day, type) {
    const date = {
      firstDay: moment(day).startOf(type).startOf('isoWeek').format('MM/DD/YYYY'),
      lastDay: moment(day).endOf(type).subtract(1,'week').endOf('isoWeek').format('MM/DD/YYYY')
    }
    return date;
  }

  public yearScroll(date) {
    this.quarterDate = moment(date);
    this.createQuarter(this.quarterDate);
    this.updateCalendar(date);
  }

  public showToday() {
    this.updateCalendar(moment());
  }

  public dateHover(day) {
    this.hoverDate = day;
  }

  public isHover(day) {
    if (!day || !this.hoverDate || this.dateForm.valid) {
      return false;
    }
    let dateFromMoment = moment(this.dateForm.value.dateFrom, 'MM/DD/YYYY');
    let dateToMoment = this.hoverDate;
    if (this.dateForm.get('dateFrom').valid) {
      return (
        (dateFromMoment.isSameOrBefore(day) && dateToMoment.isSameOrAfter(day)) ||
        (dateFromMoment.isSameOrAfter(day) && dateToMoment.isSameOrBefore(day))
      );
    }
    if (this.dateForm.get('dateFrom').valid) {
      return dateFromMoment.isSame(day);
    }
  }

  public open() {
    this.error = false;
    this.isOpened = !this.isOpened;
  }

  public submit() {
    if (!this.dateForm.valid) {
      this.error = true;
      return;
    }
    this.dateOut = {
      dateForm: this.dateForm.get('dateFrom').value,
      dateTo: this.dateForm.get('dateTo').value,
    }
    this.isOpened = false;
  }

  public cancel() {
    this.isOpened = false;
  }

  public isClick(day) {
    if(this.dateForm.get('dateFrom').valid) {
      let start = moment(this.dateForm.value.dateFrom, 'MM/DD/YYYY').endOf('isoWeek');
      return start.isSame(day.endOf('isoWeek'));
    }
  }
}
