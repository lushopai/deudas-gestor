-- Aumentar el tamaño del campo foto_perfil de usuarios para soportar URLs largas o base64
ALTER TABLE usuarios ALTER COLUMN foto_perfil TYPE TEXT;
