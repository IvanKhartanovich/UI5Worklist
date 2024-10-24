sap.ui.define([
	"zjblessons/Worklist/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"zjblessons/Worklist/model/formatter",
	"sap/m/MessageToast"
], function (
	BaseController,
	JSONModel,
	History,
	formatter,
	MessageToast
) {
	"use strict";

	return BaseController.extend("zjblessons.Worklist.controller.Object", {

		formatter: formatter,

		onInit: function () {
			var iOriginalBusyDelay,
				oViewModel = new JSONModel({
					busy: true,
					delay: 0,
					bEditMode: false,
					sSelectedTab: 'List'
				});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			this.setModel(oViewModel, "objectView");
			this.getOwnerComponent().getModel().metadataLoaded().then(function () {
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			});
		},

		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
		},

		_onObjectMatched: function (oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("zjblessons_base_Headers", {
					HeaderID: sObjectId
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},

		_bindView: function (sObjectPath) {
			var oViewModel = this.getModel("objectView"),
				oDataModel = this.getModel();

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oDataModel.metadataLoaded().then(function () {
							oViewModel.setProperty("/busy", true);
						});
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange: function () {
			var oView = this.getView(),
				oViewModel = this.getModel("objectView"),
				oElementBinding = oView.getElementBinding();
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}

			var oResourceBundle = this.getResourceBundle(),
				oObject = oView.getBindingContext().getObject(),
				sObjectId = oObject.HeaderID,
				sObjectName = oObject.DocumentNumber;

			oViewModel.setProperty("/busy", false);
		},
		onIconTabBarSelect: function () {
			//TODO implement onIconTabBarSelect 
		},

		onCancelButtonPress: function () {
			this.getModel().resetChanges();
			this._setEditMode(false);
		},

		onSaveButtonPress: function (oEvent) {
			const oModel = this.getModel(),
				oView = this.getView(),
				oPendingChanges = oModel.getPendingChanges(),
				sPath = this.getView().getBindingContext().getPath().slice(1);
			if (oPendingChanges.hasOwnProperty(sPath)) {
				oView.setBusy(true);
				oModel.submitChanges({ success: () => oView.setBusy(false), error: () => oView.setBusy(false) });
			}
			this._setEditMode(false);
		},
		onEditButtonPress: function () {
			this._setEditMode(true);

		},

		_setEditMode(bEditMode) {
			const oModel = this.getModel('objectView');

			oModel.setProperty('/bEditMode', bEditMode);
		},

		onDeleteButtonPress: function (oEvent) {

			const oBindingContext = oEvent.getSource().getBindingContext(),
				skey = this.getModel().createKey('/zjblessons_base_Headers', {
					HeaderID: oBindingContext.getProperty('HeaderID')
				}), sVersion = oBindingContext.getProperty('Version');
			if (sVersion === 'D') {
				this.getModel().remove(skey);
				this.onNavBack();
			}
			else {
				MessageToast.show(this.getResourceBundle().getText('deleteNotAllowed'));
			}
		},
	});
}
);