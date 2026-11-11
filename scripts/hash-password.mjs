// scripts/hash-password.mjs
// Хеширует пароль админа для переменной ADMIN_PASSWORD_HASH.
// Использование: npm run hash-password -- "мой-пароль"
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password || password.length < 8) {
  console.error("Использование: npm run hash-password -- \"пароль\" (минимум 8 символов)");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log("\nДобавьте в .env (и удалите ADMIN_PASSWORD, чтобы не хранить пароль открыто):\n");
console.log(`ADMIN_PASSWORD_HASH="${hash}"\n`);
