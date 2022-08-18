import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import catchAsyncError from "./helpers/catchAsyncError.js";
import Order from "./models/order.js";
import errorHandler from "./helpers/errorHandler.js";

const MAX_CAPACITY = 100;

export const runApp = () => {
  const app = express();

  app.use(
    cors({
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
      exposedHeaders: ["x-auth-token"],
    })
  );
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json({ limit: "50mb" }));

  app.route("/").get((req, res) => {
    res.sendFile(process.cwd() + "/src/docs/index.html");
  });

  //   CREATE ORDER
  app.route("/add").post(
    catchAsyncError(async (req, res, next) => {
      let { quantity, customer, date } = req.body;

      if (!date) {
        date = new Date().toISOString().substring(0, 10);
      }

      const orders = await Order.find({ date: date });

      const totalQuantity = orders.reduce((acc, curr) => {
        return acc + curr.quantity;
      }, 0);

      if (totalQuantity >= MAX_CAPACITY) {
        return next(new errorHandler("Capacity exceeded for today", 400));
      }

      const order = await Order.create({
        quantity,
        customer,
        date,
      });

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        order,
      });
    })
  );

  // UPDATE ORDER
  app.route("/update/:id").put(
    catchAsyncError(async (req, res, next) => {
      const { id } = req.params;

      const order = await Order.findById(id);

      if (!order) {
        return next(new errorHandler("Order not found", 404));
      }

      let { quantity, customer } = req.body;

      if (quantity) {
        order.quantity = quantity;
      }

      if (customer) {
        order.customer = customer;
      }

      await order.save();

      res.status(200).json({
        success: true,
        message: "Order updated successfully",
        order,
      });
    })
  );

  // UPDATE ORDER STATUS
  app.route("/updateStatus/:id").put(
    catchAsyncError(async (req, res, next) => {
      const { id } = req.params;

      const order = await Order.findById(id);

      if (!order) {
        return next(new errorHandler("Order not found", 404));
      }

      let { status } = req.body;

      if (["placed", "packed", "dispatched", "delivered"].includes(status)) {
        order.status = status;
      } else {
        return next(new errorHandler("Invalid status", 400));
      }

      await order.save();

      res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        order,
      });
    })
  );

  // DELETE ORDER
  app.route("/delete/:id").delete(
    catchAsyncError(async (req, res, next) => {
      const { id } = req.params;

      const order = await Order.findById(id);

      if (!order) {
        return next(new errorHandler("Order not found", 404));
      }

      await order.remove();

      res.status(200).json({
        success: true,
        message: "Order deleted successfully",
      });
    })
  );

  // CHECK CAPACITY
  app.route("/checkCapacity/:date").get(
    catchAsyncError(async (req, res, next) => {
      const { date } = req.params;

      const orders = await Order.find({ date: date });

      if (orders.length <= 0) {
        return next(new errorHandler("No orders yet", 400));
      }

      const totalQuantity = orders.reduce((acc, curr) => {
        return acc + curr.quantity;
      }, 0);

      res.status(200).json({
        success: true,
        capacity: MAX_CAPACITY - totalQuantity,
      });
    })
  );

  // GET ALL ORDERS
  app.route("/orders").get(
    catchAsyncError(async (req, res, next) => {
      const orders = await Order.find();

      if (orders.length <= 0) {
        return next(new errorHandler("No orders yet", 404));
      }

      res.status(200).json({
        success: true,
        count: orders.length,
        orders,
      });
    })
  );

  return app;
};

export const closeApp = (app) => {
  // Middleware for Errors
  app.use(errorMiddleware);
  app.use("*", (req, res, next) => {
    res.status(404).json({
      success: false,
      message: "API endpoint not found.",
    });
  });
};
