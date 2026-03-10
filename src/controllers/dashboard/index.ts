import { responseMessage, ROLES, status_code } from "../../common";
import { billModel, categoryModel, companyModel, productModel, userModel } from "../../database";
import { sendError, sendSuccess, applyMedicalStoreScope, reqInfo } from "../../helper";
import { countData } from "../../helper/database_service";

export const get_dashboard_stats = async (req, res) => {
  reqInfo(req);
  try {
    const countQuery: any = { isDeleted: false };
    const userQuery: any = { isDeleted: false, role: { $ne: ROLES.admin } };

    applyMedicalStoreScope(req, countQuery);
    applyMedicalStoreScope(req, userQuery);

    const [bills, products, companies, categories, users] = await Promise.all([
      countData(billModel, countQuery),
      countData(productModel, countQuery),
      countData(companyModel, countQuery),
      countData(categoryModel, countQuery),
      countData(userModel, userQuery),
    ]);

    return sendSuccess(
      res,
      {
        stats: {
          bills,
          products,
          companies,
          categories,
          users,
        },
      },
      responseMessage.getDataSuccess("dashboard stats")
    );
  } catch (err) {
    return sendError(res, status_code.BAD_REQUEST, responseMessage.customMessage("failed to fetch dashboard stats"), err?.message);
  }
};
