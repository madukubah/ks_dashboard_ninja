odoo.define('ks_dashboard_ninja_list.ks_dashboard_item_preview', function (require) {
    "use strict";

    // var registry = require('web.field_registry');
    // var AbstractField = require('web.AbstractField');
    var Widget = require('web.Widget');

    var core = require('web.core');
    // var field_utils = require('web.field_utils');
    var session = require('web.session');
    var utils = require('web.utils');
    var form_common = require('web.form_common');
    
    var QWeb = core.qweb;
    console.log('ks_dashboard_item_preview');

    var KsItemPreview = form_common.AbstractField.extend({
        init: function(parent, context) {
            this._super(parent, context);
            console.log('KsItemPreview');
        },
    });
    // registry.add('ks_dashboard_item_preview', KsItemPreview);
    // core.action_registry.add('ks_dashboard_item_preview', KsItemPreview);
    core.form_widget_registry.add('ks_dashboard_item_preview', KsItemPreview);

    return KsItemPreview
});