export default function () {
        return (
                <div className='absolute w-64 h-64 flex items-center justify-center rounded-full bg-black'>
                        <div className='text-white text-3xl font-bold z-10'>bolt</div>

                        <div className='absolute inset-0 flex items-center justify-center animate-spin-slow pointer-events-none'>
                                <p className='text-white text-sm whitespace-nowrap [transform:rotate(0deg)_translateY(-8.5rem)]'>POWERED BY BOLT • POWERED BY BOLT • POWERED BY BOLT •</p>
                        </div>
                </div>
        )
}
