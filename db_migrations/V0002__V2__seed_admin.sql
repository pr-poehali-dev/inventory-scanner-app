
INSERT INTO users (email, name, password_hash, role)
VALUES (
  'v.ermikhin@door.ru',
  'Ермихин В.',
  encode(sha256('heps458lokt'::bytea), 'hex'),
  'admin'
);
