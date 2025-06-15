'use client';

import { useState } from 'react';
import { useAdmin } from '@/providers/AdminProvider';
import { PackageStudentType } from '@/rails/model/PackageStudentModel';
import { X } from 'lucide-react';

interface PackageTableSelectionProps {
    selectedPackageId: string | null;
    onPackageSelectionChange: (packageId: string | null) => void;
}

export function PackageTableSelection({
    selectedPackageId,
    onPackageSelectionChange
}: PackageTableSelectionProps) {
    const { packagesData } = useAdmin();
    const [searchTerm, setSearchTerm] = useState('');
    const [isTableCollapsed, setIsTableCollapsed] = useState(false);

    const packages = packagesData.map(pkg => pkg.model);

    const filteredPackages = packages.filter(pkg => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return [
            pkg.description,
            pkg.price?.toString(),
            pkg.capacity?.toString(),
            pkg.duration?.toString()
        ].some(field => 
            field?.toLowerCase().includes(searchLower)
        );
    });

    const selectedPackage = packages.find(pkg => pkg.id === selectedPackageId);

    const handlePackageToggle = (packageId: string) => {
        const isSelected = selectedPackageId === packageId;
        
        if (isSelected) {
            onPackageSelectionChange(null);
            setIsTableCollapsed(false);
        } else {
            onPackageSelectionChange(packageId);
            setIsTableCollapsed(true);
        }
    };

    const handleReopenTable = () => {
        setIsTableCollapsed(false);
    };

    const formatPrice = (price: number) => `€${Math.round(price)}`;
    const formatDuration = (duration: number) => `${duration / 60}h`;

    // Summary Card Component
    const PackageSummaryCard = ({ pkg }: { pkg: PackageStudentType }) => (
        <div className="border border-border rounded-lg p-6 bg-card">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-card-foreground">
                    Selected Package
                </h3>
                <button
                    type="button"
                    onClick={handleReopenTable}
                    className="px-3 py-1.5 text-sm font-medium rounded-md border border-border text-muted-foreground hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                    Change Package
                </button>
            </div>
            
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-card-foreground">
                        {pkg.description || 'Kitesurfing Package'}
                    </span>
                    <span className="text-lg font-semibold text-primary">
                        {formatPrice(pkg.price || 0)}
                    </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border">
                    <div className="text-center">
                        <div className="text-sm font-medium text-card-foreground">
                            {formatDuration(pkg.duration || 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">Duration</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm font-medium text-card-foreground">
                            {pkg.capacity || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Capacity</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm font-medium text-card-foreground">
                            {formatPrice(((pkg.price || 0) / (pkg.duration || 1)) * 60)}
                        </div>
                        <div className="text-xs text-muted-foreground">Per Hour</div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-4 px-2">
            {/* Show summary card when package is selected and table is collapsed */}
            {isTableCollapsed && selectedPackage ? (
                <div className="animate-in slide-in-from-top-4 duration-300 ease-out">
                    <PackageSummaryCard pkg={selectedPackage} />
                </div>
            ) : (
                /* Table View */
                <div className="animate-in slide-in-from-bottom-4 duration-300 ease-out">
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchTerm('')}
                                        className="h-6 w-6 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        title="Clear search"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                                
                                <h3 className="text-lg font-semibold text-card-foreground">
                                    All Packages
                                </h3>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {filteredPackages.length} packages
                            </div>
                        </div>

                        {/* Search */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search packages by description, price, or capacity..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="border border-border rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left p-3 text-sm font-medium">Description</th>
                                    <th className="text-left p-3 text-sm font-medium">Price</th>
                                    <th className="text-left p-3 text-sm font-medium">Duration</th>
                                    <th className="text-left p-3 text-sm font-medium">Capacity</th>
                                    <th className="text-left p-3 text-sm font-medium">Price/Hour</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPackages && filteredPackages.length > 0 ? (
                                    filteredPackages.map((pkg) => {
                                        const isSelected = selectedPackageId === pkg.id;
                                        const pricePerHour = ((pkg.price || 0) / (pkg.duration || 1)) * 60;

                                        return (
                                            <tr
                                                key={pkg.id}
                                                className={`border-t border-border transition-all duration-200 ease-in-out cursor-pointer hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                                                    isSelected
                                                        ? 'bg-primary/10 border-l-4 border-l-primary'
                                                        : ''
                                                }`}
                                                onClick={() => handlePackageToggle(pkg.id)}
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        handlePackageToggle(pkg.id);
                                                    }
                                                }}
                                            >
                                                <td className="p-3 text-sm">
                                                    {pkg.description || 'Kitesurfing Package'}
                                                </td>
                                                <td className="p-3 text-sm font-medium">
                                                    {formatPrice(pkg.price || 0)}
                                                </td>
                                                <td className="p-3 text-sm">
                                                    {formatDuration(pkg.duration || 0)}
                                                </td>
                                                <td className="p-3 text-sm">
                                                    {pkg.capacity || 0}
                                                </td>
                                                <td className="p-3 text-sm">
                                                    {formatPrice(pricePerHour)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                            No packages found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}