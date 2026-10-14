// localStorage o'ramlari. Xususiy (inkognito) rejimda, to'lib qolganda yoki
// brauzer saytga xotira bermaganda localStorage XATO tashlaydi — ilova bundan
// yiqilmasligi kerak, shunchaki qoralama saqlanmay qoladi.

export function readStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeStorage(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // e'tiborsiz
  }
}
