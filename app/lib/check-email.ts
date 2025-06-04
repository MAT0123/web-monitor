export function checkEmail(email: string) {
  const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  console.log(regex.test(email));
  return regex.test(email);
}
