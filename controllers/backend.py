# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import http
from odoo.http import request


class DashboardBackend(http.Controller):

    @http.route('/dashboard/ks_fetch_dashboard_data', type="json", auth='user')
    def ks_fetch_dashboard_data(self, dashboard_id ):
        dashboard = request.env['ks_dashboard_ninja.board'].search( [ ( 'id', '=', dashboard_id ) ], limit = 1 )
        return {
            'name' : dashboard.name,
            'ks_dashboard_manager' : True,
        }
    
    @http.route('/dashboard/ks_dashboard_ninja_write', type="json", auth='user')
    def ks_dashboard_ninja_write(self, dashboard_id, values ):
        dashboard = request.env['ks_dashboard_ninja.board'].search( [ ( 'id', '=', dashboard_id ) ], limit = 1 )
        if dashboard :
            dashboard.write( values )
        return True
        
