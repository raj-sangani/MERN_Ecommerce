const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncError');
const ApiFeatures = require('../utils/apifeatures');


//create product --Admin
exports.createProduct = catchAsyncErrors(
    async (req,res,next)=>{
        req.body.user = req.user.id;

        const product = await Product.create(req.body);
        res.status(201).json({
            success:true,
            product
        });
    }
    
);


//get All products
exports.getAllProducts = catchAsyncErrors(

    
    async (req, res)=>{
        const resultPerPage = 5;
        const productCount = await Product.countDocuments();
        const apiFeature = new ApiFeatures(Product.find(),req.query).search().filter().pagination(resultPerPage);
      
        const products = await apiFeature.query;
        res.status(200).json({
            success:true,
            products
        });
    }
);    

//update products --Admin
exports.updateProduct = catchAsyncErrors(
    async (req,res,next)=>{
        let product = await Product.findById(req.params.id);
        if(!product){
            return next(new ErrorHandler('Product not found',404));
        }
        product = await Product.findByIdAndUpdate(req.params.id,req.body,{new:true, runValidators:true,useFindandModify:false});
    
        res.status(200).json({
            success:true,
            product,
            productCount
        });
    }
    
);

//delete product --Admin

exports.deleteProduct = catchAsyncErrors(
    async (req,res,next)=>{
        const product = await Product.findById(req.params.id);
        if(!product){
            return next(new ErrorHandler('Product not found',404));
        }
        await product.deleteOne();
        res.status(200).json({
            success:true,
            message:'Product is deleted'
        });
    }
);


//get single product details
exports.getProductDetails = catchAsyncErrors(
    async (req,res,next)=>{
        const product = await Product.findById(req.params.id);
        if(!product){
            return next(new ErrorHandler('Product not found',404));
        }
        res.status(200).json({
            success:true,
            product
        });
    }
);