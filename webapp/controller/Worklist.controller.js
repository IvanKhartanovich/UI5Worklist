sap.ui.define([
	"zjblessons/Worklist/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"zjblessons/Worklist/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/ui/model/FilterOperator",
	"sap/m/Text"
], function (BaseController,
	JSONModel,
	formatter,
	Filter,
	Sorter,
	FilterOperator,
	Text) {
	"use strict";

	return BaseController.extend("zjblessons.Worklist.controller.Worklist", {

		formatter: formatter,

		onInit: function () {
			var oViewModel = new JSONModel({});
			this.setModel(oViewModel, "worklistView");
		},


		onBeforeRendering: function () {
			this._bindTable();
		},

		onLiveChangeDNumberSField: function (oEvent) {
			const sValue = oEvent.getParameter('newValue');

			this._searchHandler('DocumentNumber', FilterOperator.Contains, sValue);
		},

		_bindTable: function () {
			const oTable = this.getView().byId('table');

			oTable.bindItems({
				path: '/zjblessons_base_Headers',
				sorter: [new Sorter('DocumentDate', true)],
				template: this._getTableTemplate(),
				templateSharable: true,
				urlParameters: {
					$select: 'HeaderID,DocumentNumber,DocumentDate,PlantText,Description,Created'
				},
				events: {
					dataReceived: (oData) => { debugger },
					dataRequested: (oData) => { debugger },
				}
			});
		},

		_getTableTemplate: function () {
			const oTemplate = new sap.m.ColumnListItem({
				type: 'Navigation',
				navigated: true,
				cells: [
					new sap.m.Text({
						text: '{DocumentNumber}'
					}), new sap.m.Text({
						text: '{DocumentDate}'
					}), new sap.m.Text({
						text: '{PlantText}'
					}), new sap.m.Text({
						text: '{Description}'
					}), new sap.m.Text({
						text: '{Created}'
					}),
				]
			});
			return oTemplate;
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