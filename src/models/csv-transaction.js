class CsvTransaction {
  constructor(year, month, day, description, value, source, key) {
    // var key = Utilities.base64Encode(date + description + value);
    let sanitizedMonth = month;
    if (month.length === 1) {
      sanitizedMonth = `0${month}`;
    }
    let sanitizedDay = day;
    if (day.length === 1) {
      sanitizedDay = `0${day}`;
    }
    const updatedDescription = description.replace(/,/g, ';').trim();
    this.key = key === '' ? `${year + sanitizedMonth + sanitizedDay}_${updatedDescription}${value}${source}` : key;
    this.year = year;
    this.month = sanitizedMonth;
    this.day = sanitizedDay;
    this.description = updatedDescription;
    this.value = value;
    this.source = source;
    this.yearMonth = `${year}-${sanitizedMonth}`;
  }
}
