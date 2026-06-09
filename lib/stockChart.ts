export type StockChartEntry = {
  hari: string;
  masuk: number;
  keluar: number;
};

const weekdayFormatter = new Intl.DateTimeFormat("id-ID", { weekday: "short" });

export function buildWeeklyStockChart(transactions: Array<{ jumlah: number; tipe: string; createdAt: Date }>) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - index));
    return {
      date,
      hari: weekdayFormatter.format(date),
      masuk: 0,
      keluar: 0,
    };
  });

  const findBucket = (transactionDate: Date) => {
    const txDate = new Date(transactionDate);
    txDate.setHours(0, 0, 0, 0);
    return days.find((day) => day.date.getTime() === txDate.getTime());
  };

  transactions.forEach((transaction) => {
    const bucket = findBucket(new Date(transaction.createdAt));
    if (!bucket) return;
    if (transaction.tipe === "MASUK") bucket.masuk += transaction.jumlah;
    if (transaction.tipe === "KELUAR") bucket.keluar += transaction.jumlah;
  });

  return days.map(({ hari, masuk, keluar }) => ({ hari, masuk, keluar }));
}
