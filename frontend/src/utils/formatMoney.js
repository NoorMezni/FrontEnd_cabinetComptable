export function formatMoney(amount, currency = "TND") {
    if (amount === null || amount === undefined || amount === "") {
        return "—";
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount)) {
        return "—";
    }

    return new Intl.NumberFormat("fr-TN", {
        style: "currency",
        currency,
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
    }).format(numericAmount);
}

export default formatMoney;