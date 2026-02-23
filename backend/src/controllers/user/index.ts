import { responseMessage, status_code } from "../../common";
import { authModel } from "../../model";
import { joiValidationOptions, userValidation } from "../../validation";

const toPositiveInt = (value: any, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};

//================ get all users controller==============
export const getAllUsers = async (req , res)=>{
    try {
        const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
        const page = toPositiveInt(req.query.page, 1);
        const limit = toPositiveInt(req.query.limit, 10);
        const search = (req.query.search || "").toString().trim();
        const sortBy = (req.query.sortBy || "createdAt").toString();
        const order = (req.query.order || "desc").toString().toLowerCase() === "asc" ? 1 : -1;

        const query: any = { isDeleted: false };
        if (search) {
          const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
          query.$or = [{ name: regex }, { email: regex }, { role: regex }];
        }

        const total = await authModel.Auth_Collection.countDocuments(query);
        let userQuery = authModel.Auth_Collection
          .find(query)
          .sort({ [sortBy]: order });
        if (hasPagination) {
          userQuery = userQuery.skip((page - 1) * limit).limit(limit);
        }
        const users = await userQuery;

        res.status(status_code.SUCCESS).json({
          status : true,
          message : responseMessage.allUsersGet_success,
          users,
          pagination: {
            page,
            limit,
            total,
            totalPages: hasPagination ? Math.ceil(total / limit) : (total > 0 ? 1 : 0),
          },
        })
    } catch (error) {
        res.status(status_code.BAD_REQUEST).json({status : false , message : responseMessage.allUsersGet_failed , error})
    }
}

// ============ Get Single User Controller ============
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await authModel.Auth_Collection.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "User fetched successfully",
      user,
    });

  } catch (error) {
    res.status(400).json({
      status: false,
      message: "Failed to fetch user",
      error,
    });
  }
};


//============ Update User controller ===============
export const updateUser = async(req ,res)=>{

    const {error, value} = userValidation.userValidaiton.validate(req.body, joiValidationOptions)

    if (error) {
        return res.status(400).json({
        status: false,
        message: error.details[0].message,
        });
    }
    
    try {
        const {id} = req.params
        const {email , name , role, phone, address, city, state, pincode} = value
        const updateData: any = { email, name, role };
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;
        if (city !== undefined) updateData.city = city;
        if (state !== undefined) updateData.state = state;
        if (pincode !== undefined) updateData.pincode = pincode;

        const result = await authModel.Auth_Collection.findByIdAndUpdate(id , updateData , {new : true})
        
        res.status(status_code.SUCCESS).json({status : true , message : responseMessage.userUpdate_success , result})
    } catch (error) {
        res.status(status_code.BAD_REQUEST).json({status : false , message : responseMessage.userUpdate_failed , error})
    }
}


//============ Delete User controller ===============
export const deleteUser = async(req ,res)=>{
      try {
        const {id} = req.params
        
        const result = await authModel.Auth_Collection.findByIdAndUpdate(id , {isDeleted : true} , {new : true})
        
        res.status(status_code.SUCCESS).json({status : true , message : responseMessage.userDeleted_success , result})
    } catch (error) {
        res.status(status_code.BAD_REQUEST).json({status : false , message : responseMessage.userDeleted_failed , error})
    }
}
