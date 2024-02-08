import categoryModels from "../models/categoryModels.js";
import slugify from "slugify";

export const createCategoryController = async (req, res) => {
  const { name } = req.body;
  try {
    if (!name) {
      return res
        .status(400)
        .send({ success: false, message: "Fields can't be empty" });
    }
    const existingCategory = await categoryModels.findOne({ name });
    if (existingCategory) {
      return res
        .status(201)
        .send({ success: true, message: "Category Already exists" });
    }
    const newCategory = await categoryModels({
      name,
      slug: slugify(name),
    });
    await newCategory.save();
    res.status(201).send({
      success: true,
      message: "New Category Successfully Created",
      newCategory,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, error, message: "Internal Server Error" });
  }
};

export const updateCategoryController = async (req, res) => {
  const { name } = req.body;
  try {
    if (!name) {
     return res
        .status(400)
        .send({ success: false, message: "Fields can't be empty" });
    }
    const ucategory = await categoryModels.findByIdAndUpdate(
      req.params.id,
      {
        name: name,
        slug: slugify(name),
      },
      { new: true }
    );
    res.status(200).send({
      ucategory,
      success: true,
      message: "Category Successfully Changed",
    });
  } catch (error) {
    console.log(error);
 return   res
      .status(500)
      .send({ success: false, error, message: "Error in update Category" });
  }
};

export const getAllCategory = async (req, res) => {
  try {
    const category = await categoryModels.find({});
    if (!category) {
   return   res.status(400).send({ success: false, message: "No Category Found" });
    }
    res.status(200).send({
      category,
      success: true,
      message: "Successfully Fetched all cateogries",
    });
  } catch (error) {
    console.log(error);
   return res
      .status(500)
      .send({ error, success: false, message: "Internal Server Error" });
  }
};

export const getSingleCategory = async (req, res) => {
  try {
    const category = await categoryModels.findOne({ slug: req.params.slug });
    if (!category) {
    return  res.status(401).send({ success: false, message: "Category Not Found" });
    }
    res.status(200).send({
      success: true,
      message: "Successfully Fetched User Categories",
      category,
    });
  } catch (error) {
    console.log(error);
  return  res
      .status(500)
      .send({ error, message: "Internal Server Error", success: false });
  }
};

export const deleteCategory=async(req,res)=>{
    try {
        const category=await categoryModels.findByIdAndDelete(req.params.id);
        if(!category){
      return      res.status(400).send({success:false,message:"Category Not Found"});
        }
        res.status(200).send({success:true,message:"Category Successfully Deleted"});
    } catch (error) {
        console.log(error);
  return      res.status(500).send({ error, message: "Internal Server Error", success: false });;
    }
};