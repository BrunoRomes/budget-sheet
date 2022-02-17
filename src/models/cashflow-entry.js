class CashflowEntry {
  constructor(dateAsString, description, amount, replace, unique) {
    const date = new Date(dateAsString);
    const formattedDate = date.toISOString().split('T');
    this.dateString = formattedDate;
    this.key = unique ? description : `${formattedDate}_${description}`;
    this.date = date;
    this.description = description;
    this.amount = amount;
    this.replace = replace;
  }
}
