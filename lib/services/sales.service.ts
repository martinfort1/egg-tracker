// async getBuyersWithDebt(userId: string) {
//   const buyers = await this.prisma.buyer.findMany({
//     where: { userId },
//     include: {
//       sales: true
//     }
//   });

//   return buyers.map(buyer => {
//     const totalDebt = buyer.sales.reduce((acc, sale) => {
//       return acc + (sale.totalAmount - sale.amountPaid);
//     }, 0);

//     return {
//       ...buyer,
//       totalDebt,
//       hasDebt: totalDebt > 0
//     };
//   });
// }