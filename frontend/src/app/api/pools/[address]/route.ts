import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase/server";

export async function GET(
    request: Request,
    { params }: { params: { address: string } }
) {
    try {
        // Fetch pool details from Supabase
        const { data: pool, error } = await supabase
            .from('pools')
            .select('*')
            .eq('whirlpool_address', params.address)
            .single();

        if (error) {
            console.error('Error fetching pool:', error);
            return NextResponse.json(
                { error: 'Failed to fetch pool details' },
                { status: 500 }
            );
        }

        if (!pool) {
            return NextResponse.json(
                { error: 'Pool not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, pool });
    } catch (error) {
        console.error('Error fetching pool details:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch pool details' },
            { status: 500 }
        );
    }
} 