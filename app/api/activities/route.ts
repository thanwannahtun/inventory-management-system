import { NextRequest, NextResponse } from 'next/server';
import { ActivityLog } from '@/db/models/ActivityLog';
import { connectDatabase } from '@/db/config/database';
import { Op } from 'sequelize';

export async function GET(request: NextRequest) {
    try {
        await connectDatabase();

        // Extract query parameters
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const type = searchParams.get('type') || 'all';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10'); // Default to 10
        const offset = (page - 1) * limit;

        const whereClause: any = {};

        // Filter by Type
        if (type !== 'all') {
            whereClause.type = type;
        }

        // Search logic
        if (search) {
            whereClause.description = { [Op.like]: `%${search}%` };
        }

        // findAndCountAll is perfect for pagination
        const { rows, count } = await ActivityLog.findAndCountAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });

        return NextResponse.json({
            activities: rows,
            totalPages: Math.ceil(count / limit),
            totalItems: count
        });
    } catch (error) {
        console.error('Fetch Activity Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}