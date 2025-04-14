using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Softy.Server.Models.DbModels
{
    [Table("orders")]
    public class Order
    {
        [Column("id")][Key] public int Id { get; set; }
        [Column("user_id")] public int UserId { get; set; }
        [Column("available_time_id")] public int AvailableTimeId { get; set; }
        [Column("master_id")] public int MasterId { get; set; }
        [Column("status_id")] public int StatusId { get; set; }
        [Column("created_at")] public DateTime CreatedAt { get; set; }
        [Column("updated_at")] public DateTime UpdatedAt { get; set; }
        public User User { get; set; }
        public AvailableTime AvailableTime { get; set; }
        public OrderStatus Status { get; set; }

    }
}
