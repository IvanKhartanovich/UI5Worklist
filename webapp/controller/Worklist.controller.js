sap.ui.define([
	"zjblessons/Worklist/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"zjblessons/Worklist/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("zjblessons.Worklist.controller.Worklist", {

		formatter: formatter,

		onInit: function () {
			var oViewModel = new JSONModel({});
			this.setModel(oViewModel, "worklistView");
		},

		onChange: function (oEvent) {
			const sValue = oEvent.getParameter('newValue');
			this._searchHandler(sValue);
		},

		_searchHandler: function (sValue) {
			const oTable = this.getView().byId('table'),
				oFilter = new Filter('DocumentNumber', FilterOperator.Contains, sValue);

			oTable.getBinding('items').filter(oFilter);
		}

	});
}
);