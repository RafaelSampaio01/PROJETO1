# Firmware do ESP32-S3

Coloque nesta pasta os arquivos `.bin` que devem aparecer no Atualizador de firmware do MIHU Studio.

- Firmware completo ou imagem mesclada: normalmente gravado em `0x0`.
- Binário somente da aplicação ESP-IDF: normalmente gravado em `0x10000`.

Confirme o endereço produzido pelo seu processo de compilação antes de atualizar a placa.

Para mostrar a localização dos botões no atualizador, coloque a imagem nesta pasta com o nome:

`boot-reset-buttons.png`
