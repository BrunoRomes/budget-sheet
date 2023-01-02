class BaseCsvParser {
  canParse(_content) {
    return false;
  }

  parse(_content) {
    return {};
  }

  getDelim(){
    return ','
  }
}
