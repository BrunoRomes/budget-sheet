function groupBy(xs, key) {
  return xs.reduce((rv, x) => {
    const agg = rv;
    (agg[x[key]] = agg[x[key]] || []).push(x);
    return agg;
  }, {});
}
