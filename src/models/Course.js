import mongoose from "mongoose";

const courseSchema=new mongoose.Schema(
    {
        title:{
            type:String,
            required:[true,"Course title is required"],
            trim:true,
            minlength:3,
            maxlength:120
        },
        description:{
            type:String,
            required:[true,"Description is required"],
            trim:true,
            minlength:10
        },
        instructor:{
            type:String,
            required:[true,"Instructor is required"],
            trim:true
        },
        duration:{
            type:Number,
            required:[true,"Duration is required"],
            min:1,
            validate:{
                validator:Number.isInteger,
                message:"Duration must be a whole number"
            }
        },
        tags:{
            type:[String],
            default:[]
        },
        isPublished:{
            type:Boolean,
            default:true
        }
    },
    {
        timestamps:true
    }
);

const Course=mongoose.model("Course",courseSchema)

export default Course