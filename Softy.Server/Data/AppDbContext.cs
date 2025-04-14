using Microsoft.EntityFrameworkCore;
using Softy.Server.Models.DbModels;
using System.Collections.Generic;

namespace Softy.Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

        public DbSet<Service> Services { get; set; }
        public DbSet<Order> Orders { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Настройка CreatedAt и UpdatedAt
            modelBuilder.Entity<Order>()
                .Property(o => o.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            modelBuilder.Entity<Order>()
                .Property(o => o.UpdatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var entries = ChangeTracker.Entries()
                .Where(e => e.Entity is Order && (e.State == EntityState.Added || e.State == EntityState.Modified));

            foreach (var entry in entries)
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Property("CreatedAt").CurrentValue = DateTime.UtcNow;
                }
                entry.Property("UpdatedAt").CurrentValue = DateTime.UtcNow;
            }

            return base.SaveChangesAsync(cancellationToken);
        }
        public DbSet<User> Users { get; set; }
        public DbSet<OrderStatus> OrderStatuses { get; set; }
        public DbSet<ServiceType> ServiceTypes { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<AvailableTime> AvailableTimes { get; set; }
    }
}
