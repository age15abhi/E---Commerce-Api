require('dotenv').config();
require('express-async-errors');
// express

const express = require('express');
const app = express();

// rest of the pakages 
// const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload')

// database
const connectDB = require('./db/connect');

// routers
const authRouter = require('./routes/authRoute')
const userRouter = require('./routes/userRouter')
const productRouter = require('./routes/productRoutes')
const reviewRouter = require('./routes/reviewRouter')
const orderRouter = require('./routes/orderRoute')

// middlewares - import
 const errorHandlerMiddleware = require('./middleware/error-handler')
 const notFoundMiddleware = require('./middleware/not-found');
const { signedCookie } = require('cookie-parser');

// this is used to acees the req.body element]
// app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
 app.use(express.static('./public'))
app.use(fileUpload());




app.use('/api/v1/auth' , authRouter);
app.use('/api/v1/users' , userRouter);
app.use('/api/v1/products' , productRouter);
app.use('/api/v1/reviews' , reviewRouter);
app.use('/api/v1/orders' , orderRouter);


// use of error handler middleware and not found middleware
// notFoundMiddleware ko error handler se phele use krna ha
// ye middleware round not exist hone par chalega
app.use(notFoundMiddleware)
// and this middle is for the successfull request so we use after 
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
