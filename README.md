# ImageToGD
Импорт изображения в уровень Geometry Dash.

1. Установите Node.js (https://nodejs.org/ru/)
2. Откройте Install.bat, и подождите до закрытия файла
3. Вы можете изменить конфиг изображения (./config.json)
  ```js
  {
      "circle_count": <Number>,
      "RENDER_MODE": <Boolean>,
      "offsetX": <Number>
  }
  ```
  "circle_count": <Количество кружков> - чем больше тем лучше видно изображение, Default: 300
  
  "RENDER_MODE": <Правда/Ложь> Default: true
  
  "offsetX": <x> - на сколько отдалить изображение от начала по координате "X", Default: 0
  

4. Загрузите изображение в папку Image (./image/your_image.(png | jpg | jpeg | bmp))
5. Запустите start.bat
6. Готово!
