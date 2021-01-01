# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import http
from odoo.http import request


class DashboardBackend(http.Controller):

    @http.route('/dashboard/ks_fetch_dashboard_data', type="json", auth='user')
    def ks_fetch_dashboard_data(self, dashboard_id ):
        dashboard = request.env['ks_dashboard_ninja.board'].search( [ ( 'id', '=', dashboard_id ) ], limit = 1 )
        if not dashboard:
            return {}
        dashboard.ks_set_date(dashboard_id)
        dashboard_data =  {
            'name' : dashboard.name,
            'ks_dashboard_manager' : True,
            'ks_dashboard_list': dashboard.search_read([], ['id', 'name']),
            'ks_dashboard_start_date': dashboard.ks_dashboard_start_date,
            'ks_dashboard_end_date': dashboard.ks_dashboard_end_date,
            'ks_date_filter_selection': dashboard.ks_date_filter_selection,
            'ks_gridstack_config': dashboard.ks_gridstack_config,
            'ks_set_interval': dashboard.ks_set_interval,
        }
        if len(dashboard.ks_dashboard_items_ids) < 1:
            dashboard_data['ks_item_data'] = False
        else:
            items = dashboard.ks_fetch_item(dashboard.ks_dashboard_items_ids.ids)
            dashboard_data['ks_item_data'] = items

        return dashboard_data

    
    @http.route('/dashboard/ks_dashboard_ninja_write', type="json", auth='user')
    def ks_dashboard_ninja_write(self, dashboard_id, values ):
        dashboard = request.env['ks_dashboard_ninja.board'].search( [ ( 'id', '=', dashboard_id ) ], limit = 1 )
        if dashboard :
            dashboard.write( values )
            return  {
                'name' : dashboard.name,
                'ks_dashboard_manager' : True,
                'ks_dashboard_list': dashboard.search_read([], ['id', 'name']),
                'ks_dashboard_start_date': dashboard.ks_dashboard_start_date,
                'ks_dashboard_end_date': dashboard.ks_dashboard_end_date,
                'ks_date_filter_selection': dashboard.ks_date_filter_selection,
                'ks_gridstack_config': dashboard.ks_gridstack_config,
                'ks_set_interval': dashboard.ks_set_interval,
            }
        return True

    @http.route('/dashboard/ks_dashboard_ninja_item_copy', type="json", auth='user')
    def ks_dashboard_ninja_item_copy(self, ks_item_id, values ):
        dashboard_item = request.env['ks_dashboard_ninja.item'].search( [ ( 'id', '=', ks_item_id ) ], limit = 1 )
        if dashboard_item :
            new_item = dashboard_item.copy( values )
        return new_item.id
    
    @http.route('/dashboard/ks_dashboard_ninja_item_unlink', type="json", auth='user')
    def ks_dashboard_ninja_item_unlink(self, ks_item_id ):
        dashboard_item = request.env['ks_dashboard_ninja.item'].search( [ ( 'id', '=', ks_item_id ) ], limit = 1 )
        if dashboard_item :
            dashboard_item.unlink( )
        return True
        
