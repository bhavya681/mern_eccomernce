import slugify from "slugify";
import productModels from "../models/productModels.js";
import categoryModels from "../models/categoryModels.js";
import fs from "fs";
import braintree from "braintree";
import dotenv from "dotenv";
import orderModels from "../models/orderModels.js";
dotenv.config();
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAIN_TREE_MERCHANT_ID,
  publicKey: process.env.BRAIN_TREE_PUBLIC_KEY,
  privateKey: process.env.BRAIN_TREE_PRIVATE_KEY,
});

export const createProductController = async (req, res) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !quantity ||
      !shipping
    ) {
      return res.status(500).send({ error: "Fields can't be empty" });
    }
    if (photo?.size > 100000) {
      return res.status(400).send({
        success: false,
        message: "Photo is required and size should be less than 1mb",
      });
    }
    const products = await productModels({
      ...req.fields,
      slug: slugify(name),
    });
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    return res.status(200).send({
      products,
      success: true,
      message: "Product Successfully created",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ error, success: false, message: "Internal Server Error" });
  }
};

export const getProductController = async (req, res) => {
  try {
    const products = await productModels
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      message: "Product Successfully Fetched",
      totalcount: products.length,
      products,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ error, success: false, message: "Internal Server Error" });
  }
};

export const getProductSingleController = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await productModels
      .findOne({ slug })
      .select("-photo")
      .populate("category");

    res.status(200).send({
      success: true,
      message: "Successfully fetched product",
      product,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ error, success: false, message: "Internal Server Error" });
  }
};

export const productPhotoController = async (req, res) => {
  try {
    const product = await productModels
      .findById(req.params.pid)
      .select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal Server Error", error });
  }
};

export const deleteProductController = async (req, res) => {
  try {
    await productModels.findByIdAndDelete(req.params.pid).select("-photo");
    return res
      .status(200)
      .send({ success: true, message: "Product Deleted Successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal Server Error", error });
  }
};

export const updateProductController = async (req, res) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !quantity ||
      !shipping
    ) {
      return res.status(500).send({ error: "Fields can't be empty" });
    }
    if (photo?.size > 100000) {
      return res.status(400).send({
        success: false,
        message: "Photo is required and size should be less than 1mb",
      });
    }
    const products = await productModels.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );

    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    return res.status(200).send({
      products,
      success: true,
      message: "Product Successfully Updated",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ error, success: false, message: "Internal Server Error" });
  }
};

export const productFiltersController = async (req, res) => {
  try {
    const { radio, checked } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModels.find(args);
    res.status(200).send({ success: true, products });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ error, success: false, message: "Internal Server Error" });
  }
};

export const productCountController = async (req, res) => {
  try {
    const total = await productModels.find({}).estimatedDocumentCount();
    res.status(200).send({ success: true, total });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ error, success: false, message: "Internal Server Error" });
  }
};

export const productListController = async (req, res) => {
  try {
    const perPage = 5;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModels
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({ success: true, products });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ error, success: false, message: "Internal Server Error" });
  }
};

export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await productModels
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    res.json({ results });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ error, success: false, message: "Internal Server Error" });
  }
};

export const productRealtedController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModels
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(3)
      .populate("category");
    res.status(200).send({ products });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ error, success: false, message: "Internal Server Error" });
  }
};

export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModels.findOne({ slug: req.params.slug });
    const products = await productModels
      .find({ category })
      .populate("category");
    res.status(200).send({ success: true, category, products });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ error, success: false, message: "Internal Server Error" });
  }
};

export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send({ err });
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    return res
      .status(500)
      .send({ error, success: false, message: "Internal Server Error" });
  }
};

// export const braintreePaymentController = async (req, res) => {
//   try {
//     const { cart, nonce } = req.body;
//     let total = 0;
//     cart.map((i) => {
//       total += i.price;
//     });
//     let newTransaction=gateway.transaction.sale({
//       amount:total,
//       paymentMethodNonce:nonce,
//       options:{
//         submitForsettlenment:true
//       }
//     },
//    function(err,res){
//       if(res){
//         const order=orderModels({
//           products:cart,
//           payment:result,
//           buyer:req._id
//         }).save()
//         res.json({ok:true})
//       }else{
//         res.status(500).send(err)
//       }
//     }
// )
//   } catch (error) {
//     return res
//       .status(500)
//       .send({ error, success: false, message: "Internal Server Error" });
//   }
// };

export const braintreePaymentController = async (req, res) => {
  try {
    const { cart, nonce } = req.body;
    let total = 0;
    cart.forEach((item) => {
      total += item.price;
    });

    gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      (err, result) => {
        // Corrected the function parameters here
        if (result) {
          const order = new orderModels({
            // Assuming orderModels is your Mongoose model
            products: cart,
            payment: result,
            buyer: req._id,
          });
          order.save(); // Save the order to the database
          res.json({ ok: true });
        } else {
          res.status(500).send(err); // Send the error message
        }
      }
    );
  } catch (error) {
    return res
      .status(500)
      .send({ error, success: false, message: "Internal Server Error" });
  }
};

export const orderController = async (req, res) => {
  try {
    const orders = await orderModels
      .find({ buyer: req._id })
      .populate({ path: "buyer", select: "name" })
      .populate("products", "-photo");
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export const allOrderController = async (req, res) => {
  try {
    const orders = await orderModels
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export const changeOrderStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const orders = await orderModels.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    res.status(200).json({ orders, success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};
