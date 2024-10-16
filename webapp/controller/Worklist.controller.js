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

		onLiveChangeDNumberSField: function (oEvent) {
			const sValue = oEvent.getParameter('newValue');

			this._searchHandler('DocumentNumber', FilterOperator.Contains, sValue);
		},

		searchPTextSField: function (oEvent) {
			const sValue = oEvent.getParameter('query');

			this._searchHandler('PlantText', FilterOperator.EQ, sValue);
		},

		_searchHandler: function (sPath, vOperator, sValue) {
			const oTable = this.getView().byId('table'),
				oFilter = !!sValue.length ? new Filter(sPath, vOperator, sValue) : [];

			oTable.getBinding('items').filter(oFilter);
		}

	});
}
);