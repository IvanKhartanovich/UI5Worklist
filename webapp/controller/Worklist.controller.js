sap.ui.define([
	"zjblessons/Worklist/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"zjblessons/Worklist/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast"
], function (BaseController,
	JSONModel,
	formatter,
	Filter,
	Sorter,
	FilterOperator,
	Fragment,
	MessageToast) {
	"use strict";

	return BaseController.extend("zjblessons.Worklist.controller.Worklist", {

		formatter: formatter,

		onInit: function () {
			var oViewModel = new JSONModel({
				sCount: '0'
			});
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
					dataRequested: (oData) => { this._getTableCounter() },
				}
			});
		},

		_getTableCounter: function () {
			this.getModel().read('/zjblessons_base_Headers/$count', {
				success: (sCount) => { this.getModel('worklistView').setProperty('/sCount', sCount) }
			})
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
						text: '{RegionText}'
					}), new sap.m.Text({
						text: '{Description}'
					}), new sap.m.Text({
						text: '{Created}'
					}), new sap.m.Switch({
						customTextOn: 'D',
						customTextOff: 'A',
						state: "{= ${Version} === 'D'}",
						change: this._changeVersion.bind(this),
					}), new sap.m.Button({
						type: 'Transparent',
						icon: this.getResourceBundle().getText('declineIcon'),
						press: this._onPressDelete.bind(this),
					}),
				]
			});
			return oTemplate;
		},

		_changeVersion: function (oEvent) {
			const sVersion = oEvent.getParameter('state') === true ? 'D' : 'A',
				sPath = oEvent.getSource().getBindingContext().getPath();
			this.getModel().setProperty(sPath + '/Version', sVersion);

			this.getModel().submitChanges({});
		},

		_onPressDelete: function (oEvent) {

			const oBindingContext = oEvent.getSource().getBindingContext(),
				skey = this.getModel().createKey('/zjblessons_base_Headers', {
					HeaderID: oBindingContext.getProperty('HeaderID')
				}), sVersion = oBindingContext.getProperty('Version');
			if (sVersion === 'D') {
				this.getModel().remove(skey);
			}
			else {
				MessageToast.show(this.getResourceBundle().getText('deleteNotAllowed'));
			}
		},

		onPressRefresh: function () {
			this._bindTable()
		},

		onPressAdd: function () {
			this._loadCreateDialog();
		},

		searchPTextSField: function (oEvent) {
			const sValue = oEvent.getParameter('query');

			this._searchHandler('PlantText', FilterOperator.EQ, sValue);
		},

		_searchHandler: function (sPath, vOperator, sValue) {
			const oTable = this.getView().byId('table'),
				oFilter = !!sValue.length ? new Filter(sPath, vOperator, sValue) : [];

			oTable.getBinding('items').filter(oFilter);
		},

		_loadCreateDialog: async function () {
			if (!this._oDialog) {
				this._oDialog = Fragment.load({
					name: "zjblessons.Worklist.view.fragment.CreateDialog",
					controller: this,
					id: 'Dialog',
				});
				this._oDialog.then((oDialog) => {
					this._oDialog = oDialog;
					this.getView().addDependent(this._oDialog);
					this._oDialog.open();
				});
			} else { this._oDialog.open() }

		},

		onDialogBeforeOpen: function (oEvent) {
			const oDialog = oEvent.getSource(),
				oParams = {
					Version: 'A',
				},
				oEntry = this.getModel().createEntry('/zjblessons_base_Headers', { properties: oParams });

			oDialog.setBindingContext(oEntry);
		},

		onCancelButtonPress: function () {
			this.getModel().resetChanges();
			this._oDialog.close();
		},

		onSaveButtonPress: function (oEvent) {
			this.getModel().submitChanges({
				success: () => {
					MessageToast.show(this.getResourceBundle().getText('toastCreated'));
					this._bindTable();
					this.bind
				}
			});
			this._oDialog.close();
		},

		onIconTabHeaderSelect: function (oEvent) {
			const oBinding = this.byId("table").getBinding("items");
			var sKey = oEvent.getParameter("key"),
				oFilter = '';

			if (sKey === "Deactivated") {
				oFilter = new Filter('Version', 'EQ', 'D', false);
			} else if (sKey === "All") {
				oFilter = '';
			}

			oBinding.filter(oFilter);
		}
	});
}
);