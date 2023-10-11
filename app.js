


const express = require('express');

const { PORT = 3000 } = process.env;

const app = express(); 

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
    useFindAndModify: false
});


app.get('/', (req, res) => {
    res.send(
          `<html>
          <body>
              <p>Ответ на сигнал из далёкого космоса</p>
          </body>
          </html>`
      );
  }); 

app.listen(PORT, () => {
    // Если всё работает, консоль покажет, какой порт приложение слушает
    console.log(`App listening on port ${PORT}`)
}) 