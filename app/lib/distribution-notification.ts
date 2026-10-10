type DistributionQuantities = {
  plannedBread: unknown;
  plannedEgg: unknown;
  plannedBanana: unknown;
  receivedBread: unknown;
  receivedEgg: unknown;
  receivedBanana: unknown;
};

const bengaliNumber = new Intl.NumberFormat("bn-BD", { useGrouping: false });

function quantity(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
}

export function buildDistributionIssueSummary(values: DistributionQuantities) {
  const items = [
    { label: "বনরুটি", planned: values.plannedBread, received: values.receivedBread },
    { label: "সিদ্ধ ডিম", planned: values.plannedEgg, received: values.receivedEgg },
    { label: "কলা", planned: values.plannedBanana, received: values.receivedBanana },
  ];

  const summaries = items.flatMap(({ label, planned, received }) => {
    const difference = quantity(received) - quantity(planned);
    if (difference < 0) {
      return `${bengaliNumber.format(Math.abs(difference))}টি ${label} পায়নি`;
    }
    if (difference > 0) {
      return `${bengaliNumber.format(difference)}টি ${label} বেশি পেয়েছে`;
    }
    return [];
  });

  return summaries.length ? summaries.join(", ") : "সম্পূর্ণ আইটেম পাওয়া গেছে";
}
